const { Sequelize } = require('sequelize');
const { createPaymentAccount } = require('../payment-api');
const { db, Op } = require('../configs/db.config');
const { v4: uuidv4 } = require('uuid');
const Account = require('../models/account.model');
const Address = require('../models/address.model');
const bcrypt = require('bcryptjs');
const District = require('../models/district.model');
const IsolationFacility = require('../models/isolation-facility.model');
const jwt = require('jsonwebtoken');
const Product = require('../models/product.model');
const ProductImage = require('../models/product-image.model');
const ProductInPackage = require('../models/product-in-package.model');
const ProductPackage = require('../models/product-package.model');
const Province = require('../models/province.model');
const TreatmentHistory = require('../models/treatment-history.model');
const User = require('../models/user.model');
const Ward = require('../models/ward.model');
const {
	STATUS_F,
	ACCOUNT_TYPES,
	MAX,
	JWT_SECRET,
	JWT_AUTHOR,
} = require('../constants/index.constant');
const ConsumptionHistory = require('../models/consumption-history.model');

// Hash password with bcrypt
exports.hashPassword = (password = '') => {
	return new Promise((resolve, reject) => {
		bcrypt.genSalt(Number(process.env.BCRYPT_SALT) || 10, function (err, salt) {
			if (err) reject(err);

			bcrypt.hash(password, salt, function (hashErr, hash) {
				if (hashErr) reject(hashErr);
				resolve(hash);
			});
		});
	});
};

// convert statusF to string
exports.convertStatusFToStr = (statusF) => {
	for (f in STATUS_F) {
		if (STATUS_F[f] === Number(statusF)) return f;
	}
	return 'Không xác định';
};

/**
 * get full address from addressId.
 *
 * @param {number} addressId - address Id of Address Model.
 * @param {number} level - result level: 1 - only details, 2 - to ward, 3 - to district, 4 - only province, 5 - district & province, default - full
 * @return {string} result - address fully.
 */
exports.getAddressUser = async (addressId, level = 0) => {
	try {
		let result = '';

		const address = await Address.findOne({
			raw: true,
			where: { addressId },
			attributes: [
				'details',
				[Sequelize.col('Ward.name'), 'wardName'],
				[Sequelize.col('Ward.prefix'), 'wardPrefix'],
				[Sequelize.col('Ward.District.name'), 'districtName'],
				[Sequelize.col('Ward.District.prefix'), 'districtPrefix'],
				[Sequelize.col('Ward.District.Province.name'), 'province'],
			],
			include: {
				model: Ward,
				attributes: [],
				include: {
					model: District,
					attributes: [],
					include: {
						attributes: [],
						model: Province,
					},
				},
			},
		});

		if (address) {
			const {
				details,
				wardName,
				wardPrefix,
				districtName,
				districtPrefix,
				province,
			} = address;

			switch (level) {
				case 1:
					return details;
				case 2:
					return `${details}, ${wardPrefix} ${wardName}`;
				case 3:
					return `${details}, ${wardPrefix} ${wardName}, ${districtPrefix} ${districtName}`;
				case 4:
					return province;
				case 5:
					return `${districtPrefix} ${districtName}, ${province}`;
				default:
					return `${details}, ${wardPrefix} ${wardName}, ${districtPrefix} ${districtName}, ${province}`;
			}
		}

		return result;
	} catch (error) {
		console.log('getAddressUser ERROR: ', error);
		return '';
	}
};

/**
 * parse sort from string to sort array.
 *
 * @param {string} sortStr - EX: "item1,-item2,-item3".
 * @return {[string]} sortList - Ex: ["item1", "item2 DESC", "item3 DESC"].
 */
exports.parseSortStr = (sortStr = '') => {
	if (!sortStr) return [];

	let sortList = [];

	const sortSplited = sortStr.split(',');
	sortSplited.forEach((item) => {
		const s = item.trim();
		if (s[0] === '-') {
			sortList.push(`${s.substring(1)} DESC`);
		} else {
			sortList.push(s);
		}
	});

	return sortList;
};

// omit some properties of an object
exports.omitPropObj = (obj, someKey = []) => {
	let newObj = {};
	for (let key in obj) {
		if (!someKey.includes(key)) newObj[key] = obj[key];
	}
	return { ...newObj };
};

// user info validation
exports.userValidation = async (user) => {
	if (!user) return { isValid: false, msg: 'Thông tin không hợp lệ' };

	const {
		fullname,
		peopleId,
		DOB,
		details,
		provinceId,
		districtId,
		wardId,
		isolationFacility,
	} = user;

	const fullnameRegex = /^[^`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~\d]{1,50}$/i;
	if (!fullname || !fullnameRegex.test(fullname)) {
		return { isValid: false, msg: 'Họ tên không hợp lệ' };
	}

	const pRegex = /^\d{9,12}$/;
	if (!peopleId || !pRegex.test(peopleId)) {
		return {
			isValid: false,
			msg: 'CMND/CCCD có 9-12 chữ số (Trường hợp trẻ dưới 14 tuổi có thể dùng CMND của người bảo hộ) !',
		};
	}

	if (!DOB || new Date(DOB).getTime() >= Date.now()) {
		return { isValid: false, msg: 'Ngày sinh không hợp lệ' };
	}

	if (!details) {
		return { isValid: false, msg: 'Vui lòng điền địa chỉ cụ thể' };
	}

	if (!provinceId || isNaN(Number(provinceId))) {
		return { isValid: false, msg: 'Vui lòng chọn tỉnh/thành phố' };
	}

	if (!districtId || isNaN(Number(districtId))) {
		return { isValid: false, msg: 'Vui lòng chọn quận/huyện' };
	}

	if (!wardId || isNaN(Number(wardId))) {
		return { isValid: false, msg: 'Vui lòng chọn xã/phường' };
	}

	if (!isolationFacility || isNaN(Number(isolationFacility))) {
		return { isValid: false, msg: 'Vui lòng chọn cơ sở điều trị' };
	}

	try {
		// check if user existence
		const userExist = await User.findOne({
			raw: true,
			where: { peopleId },
		});
		if (userExist) {
			return {
				isValid: false,
				msg: 'Người bệnh đã tồn tại (kiểm tra lại CMND/CCCD)',
			};
		}

		return { isValid: true };
	} catch (error) {
		console.error('Function userValidation Error: ', error);
		return { isValid: false, msg: 'Thông tin không hợp lệ' };
	}
};

exports.addNewAddress = async (details, wardId) => {
	if (!details || isNaN(Number(wardId))) return false;
	try {
		const address = await Address.create({ wardId: Number(wardId), details });
		return address ? address.addressId : false;
	} catch (error) {
		console.error('Function addNewAddress Error: ', error);
		return false;
	}
};

exports.createUser = async (user) => {
	const tx = await db.transaction();

	try {
		const { fullname, peopleId, DOB, addressId, statusF, managerId } = user;
		const account = await Account.create(
			{
				username: peopleId,
				password: '',
				accountType: ACCOUNT_TYPES.USER,
				isLocked: false,
				failedLoginTime: 0,
			},
			{ transaction: tx }
		);

		if (account) {
			const newUser = await User.create(
				{
					uuid: uuidv4(),
					fullname,
					peopleId,
					DOB: new Date(DOB),
					statusF: Number(statusF),
					managerId,
					addressId,
					accountId: account.accountId,
				},
				{ transaction: tx, raw: true }
			);

			// create an account in payment system
			const createPaymentAccountSuccess = await createPaymentAccount({
				username: peopleId,
				userId: newUser.userId,
			});

			if (!createPaymentAccountSuccess) {
				throw new Error();
			}

			await tx.commit();
			return newUser;
		}

		throw new Error();
	} catch (error) {
		console.error('Function newUser Error: ', error);
		await tx.rollback();
		throw new Error();
	}
};

exports.addNewTreatmentHistory = async (
	isolationFacilityId,
	userId,
	statusF
) => {
	try {
		// check capacity
		const isoFacility = await IsolationFacility.findOne({
			raw: true,
			where: { isolationFacilityId },
		});

		if (isoFacility) {
			if (isoFacility.currentQuantity >= isoFacility.capacity) {
				return {
					error: true,
					msg: `Cơ sở điều trị "${isoFacility.isolationFacilityName}" đã hết chỗ chứa`,
				};
			}

			return await TreatmentHistory.create({
				isolationFacilityId,
				userId,
				statusF: Number(statusF),
				startDate: new Date(),
				endDate: null,
			});
		}

		return {
			error: true,
			msg: `Cơ sở điều trị không tồn tại`,
		};
	} catch (error) {
		console.error('Function addNewTreatmentHistory Error: ', error);
		return {
			error: true,
			msg: `Cơ sở điều trị không tồn tại`,
		};
	}
};

exports.jwtEncode = (data, isRemember = true) => {
	const now = Date.now();
	return jwt.sign(
		{
			author: JWT_AUTHOR,
			sub: data,
			iat: now,
			exp: isRemember ? now + MAX.TOKEN_EXP : now + MAX.SESSION_EXP,
		},
		JWT_SECRET
	);
};

exports.formatCurrency = (money = 0) => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND',
	}).format(money);
};

function generateProductPackageQuery(query) {
	let {
		keyword = '',
		sortByName = -1,
		sortByPrice = -1,
		priceFrom,
		priceTo,
	} = query;

	let result = {};
	result.where = {};
	result.order = [];

	if (keyword) {
		result.where = {
			productPackageName: Sequelize.where(
				Sequelize.fn('LOWER', Sequelize.col('productPackageName')),
				'LIKE',
				`%${keyword.toLowerCase()}%`
			),
		};
	}

	if (priceFrom && priceTo) {
		result.where = {
			...result.where,
			totalPrice: {
				[Op.and]: [{ [Op.gte]: priceFrom }, { [Op.lte]: priceTo }],
			},
		};
	} else {
		if (priceFrom) {
			result.where = {
				...result.where,
				totalPrice: {
					[Op.gte]: priceFrom,
				},
			};
		}
		if (priceTo) {
			result.where = {
				...result.where,
				totalPrice: {
					[Op.lte]: priceTo,
				},
			};
		}
	}

	if (sortByPrice !== -1) {
		if (sortByPrice === 0) {
			result.order.push(['totalPrice', 'DESC']);
		} else {
			result.order.push(['totalPrice']);
		}
	}

	if (sortByName !== -1) {
		if (sortByName === 0) {
			result.order.push(['productPackageName', 'DESC']);
		} else {
			result.order.push(['productPackageName']);
		}
	}

	return result;
}

exports.getPackageList = async (page = 1, pageSize = 12, query) => {
	try {
		const packageAndCount = await ProductPackage.findAndCountAll({
			raw: true,
			...generateProductPackageQuery(query),
			attributes: ['productPackageId', 'productPackageName', 'totalPrice'],
			limit: pageSize,
			offset: (page - 1) * pageSize,
		});

		const total = packageAndCount.count;
		const packages = packageAndCount.rows;

		const promises = [];
		const productImagePromises = [];

		packages.forEach((pp) => {
			promises.push(
				// Find all products in the package
				ProductInPackage.findAll({
					raw: true,
					where: {
						productPackageId: pp.productPackageId,
					},
					include: {
						model: Product,
						attributes: [],
					},
					attributes: [
						[Sequelize.col('Product.productId'), 'productId'],
						[Sequelize.col('Product.productName'), 'productName'],
						[Sequelize.col('Product.price'), 'productPrice'],
						[Sequelize.col('Product.unit'), 'productUnit'],
					],
				}).then((data) => {
					// Add product list into the package
					pp.products = [...data];

					// Find a thumbnail for the package by the first product
					productImagePromises.push(
						ProductImage.findOne({
							raw: true,
							where: {
								productId: data[0]?.productId || 0,
								isThumbnail: true,
							},
							attributes: ['src'],
						}).then(
							(productImgSrc) => (pp.thumbnail = productImgSrc?.src || '')
						)
					);
				})
			);
		});

		await Promise.all(promises);
		await Promise.all(productImagePromises);

		return { total, page, pageSize, packages };
	} catch (error) {
		console.log('getPackageList ERROR: ', error);
		return { total: 0, page, pageSize, packages: [] };
	}
};

const getFirstDayOfWeek = () => {
	const now = new Date();
	const day = now.getDay() ? now.getDay() - 1 : 6;
	return new Date(now.getTime() - day * 86_400_000);
};

exports.countUserConsumePackage = async (userId, productPackageId) => {
	const startWeek = getFirstDayOfWeek();
	const date = new Date();
	const [y, m, d] = [date.getFullYear(), date.getMonth(), date.getDate()];
	const dateStr = `${y}-${m + 1}-${d}`;
	const startMonth = new Date(y, m, 1);
	const endMonth = new Date(y, m + 1, 0);

	try {
		let countInDay = 0,
			countInWeek = 0,
			countInMonth = 0;
		const promises = [];

		promises.push(
			ConsumptionHistory.count({
				where: {
					userId,
					productPackageId,
					buyDate: {
						[Op.and]: [
							{ [Op.gte]: new Date(dateStr) },
							{ [Op.lt]: new Date(new Date(dateStr).getTime() + 8_6400_000) },
						],
					},
				},
			}).then((count) => (countInDay = count))
		);
		promises.push(
			ConsumptionHistory.count({
				where: {
					userId,
					productPackageId,
					buyDate: {
						[Op.and]: [
							{ [Op.gte]: startWeek },
							{ [Op.lt]: new Date(new Date(dateStr).getTime() + 8_6400_000) },
						],
					},
				},
			}).then((count) => (countInWeek = count))
		);
		promises.push(
			ConsumptionHistory.count({
				where: {
					userId,
					productPackageId,
					buyDate: {
						[Op.and]: [{ [Op.gte]: startMonth }, { [Op.lt]: endMonth }],
					},
				},
			}).then((count) => (countInMonth = count))
		);

		await Promise.all(promises);
		return { day: countInDay, week: countInWeek, month: countInMonth };
	} catch (error) {
		return {
			day: 0,
			week: 0,
			month: 0,
		};
	}
};

exports.formatDateToStr = (date) => {
	const d = new Date(date);
	const y = d.getFullYear();
	const mm = `0${d.getMonth() + 1}`.slice(-2);
	const dd = `0${d.getDate()}`.slice(-2);

	return `${dd}-${mm}-${y}`;
};

exports.getFirstDayNextMonth = (date = new Date()) => {
	const now = new Date(date);
	const m = now.getMonth();
	const y = now.getFullYear();
	return new Date(m === 11 ? y + 1 : y, m === 11 ? 0 : m + 1, 1);
};
