const { DataTypes, db } = require('../configs/db.config');

const Product = db.define(
	'Product',
	{
		productId: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		productName: {
			type: DataTypes.STRING(50),
			unique: true,
			allowNull: false,
		},
		price: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		unit: {
			type: DataTypes.STRING(10),
			allowNull: false,
		},
	},
	{ tableName: 'Product', timestamps: false, initialAutoIncrement: 1000 }
);

module.exports = Product;
