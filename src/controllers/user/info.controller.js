const {
	formatCurrency,
	formatDateToStr,
	getFirstDayNextMonth,
	getAddressUser,
	convertStatusFToStr,
} = require('../../helpers/index.helpers');
const User = require('../../models/user.model');
const Notification = require('../../models/notification.model');
const Accounts = require('../../models/account.model');
const {
	getDebtInfo,
	getPaymentLimit,
	getUserBalance,
} = require('../../payment-api');
const TreatmentHistory = require('../../models/treatment-history.model');
const IsolationFacility = require('../../models/isolation-facility.model');
const { Sequelize } = require('sequelize');
const ConsumptionHistory = require('../../models/consumption-history.model');
const ProductPackage = require('../../models/product-package.model');

exports.getUserInfo = async (req, res) => {
	try {
		const { accountId, username } = req.user;
		const user = await User.findOne({
			raw: true,
			where: {
				accountId,
			},
			attributes: {
				exclude: ['userId', 'uuid', 'updatedAt', 'accountId'],
			},
		});
		const address = await getAddressUser(user.addressId);
		const manager = await Accounts.findOne({
			raw: true,
			where: {
				accountId: user.managerId,
			},
			attributes: ['username'],
		});

		return res.render('./user/info.pug', {
			userInfo: {
				...user,
				username,
				address,
				manager: manager?.username || '',
			},
			helpers: {
				formatDateToStr,
				convertStatusFToStr,
			},
		});
	} catch (error) {
		console.error('Function getUserInfo Error: ', error);
		return res.render('404');
	}
};

exports.getManagementHistory = async (req, res) => {
	const { accountId } = req.user;
	try {
		const user = await User.findOne({ raw: true, where: { accountId } });
		const treatmentHistories = await TreatmentHistory.findAll({
			raw: true,
			where: {
				userId: user?.userId,
			},
			include: {
				model: IsolationFacility,
				attributes: [],
			},
			attributes: [
				'startDate',
				'endDate',
				'statusF',
				[
					Sequelize.col('IsolationFacility.isolationFacilityName'),
					'isolationFacilityName',
				],
			],
		});
		return res.render('./user/management-history.pug', {
			treatmentHistories,
			helpers: {
				formatDateToStr,
				convertStatusFToStr,
			},
		});
	} catch (error) {
		console.error('Function getManagementHistory Error: ', error);
		return res.render('404');
	}
};

exports.getConsumptionHistory = async (req, res) => {
	const { accountId } = req.user;
	try {
		const user = await User.findOne({ raw: true, where: { accountId } });
		const consumptionHistories = await ConsumptionHistory.findAll({
			raw: true,
			where: { userId: user.userId },
			include: {
				model: ProductPackage,
				attributes: [],
			},
			attributes: [
				'totalPrice',
				'buyDate',
				[
					Sequelize.col('ProductPackage.productPackageName'),
					'productPackageName',
				],
				[Sequelize.col('ProductPackage.productPackageId'), 'productPackageId'],
			],
		});

		return res.render('./user/consumption-history.pug', {
			consumptionHistories,
			helpers: {
				formatCurrency,
				formatDateToStr,
			},
		});
	} catch (error) {
		console.error('Function getConsumptionHistory Error: ', error);
		return res.render('404');
	}
};

exports.getPaymentHistory = async (req, res) => {
	try {
		console.log('getPaymentHistory');
		return res.render('./user/payment-history.pug');
	} catch (error) {
		console.error('Function getPaymentHistory Error: ', error);
		return res.render('404');
	}
};

exports.getDebt = async (req, res) => {
	const { accountId } = req.user;

	try {
		const { userId } = await User.findOne({ raw: true, where: { accountId } });
		const debtInfo = await getDebtInfo(userId);
		const paymentLimit = await getPaymentLimit();

		return res.render('./user/debt.pug', {
			debtInfo,
			paymentLimit,
			nextTerm: getFirstDayNextMonth(),
			helpers: {
				formatDateToStr,
				formatCurrency,
			},
		});
	} catch (error) {
		console.error('Function getDebtHistory Error: ', error);
		return res.render('404');
	}
};

exports.getBalance = async (req, res) => {
	const { accountId } = req.user;

	try {
		const { userId } = await User.findOne({ raw: true, where: { accountId } });
		const balance = await getUserBalance(userId);

		return res.render('./user/balance.pug', {
			balance,
			helpers: {
				formatCurrency,
			},
		});
	} catch (error) {
		console.error('Function getBalance Error: ', error);
		return res.render('404');
	}
};

exports.getNotification = async (req, res) => {
	const { accountId } = req.user;
	try {
		const { userId } = await User.findOne({ raw: true, where: { accountId } });
		const notifications = await Notification.findAll({
			raw: true,
			where: {
				userId,
			},
			order: [['createdTime', 'DESC']],
		});

		return res.render('./user/notification.pug', {
			notifications,
			helpers: {
				formatDateToStr,
			},
		});
	} catch (error) {
		console.error('Function getNotification Error: ', error);
		return res.render('404');
	}
};

exports.getChangePassword = (req, res) => {
	return res.render('./user/change-password.pug');
};

exports.postChangePassword = async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	console.log(req.user.accountId, oldPassword, newPassword);
	try {
	} catch (error) {
		console.error('Function putChangePassword Error: ', error);
		return res.render('404');
	}
};
