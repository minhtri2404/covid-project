const { DataTypes, db } = require('../configs/db.config');
const User = require('./user.model');

const RelatedUser = db.define(
	'RelatedUser',
	{
		relatedId: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
	},
	{ tableName: 'RelatedUser', timestamps: false, initialAutoIncrement: 1000 }
);

// Foreign key
User.hasMany(RelatedUser, {
	sourceKey: 'userId',
	foreignKey: {
		name: 'originUserId',
		allowNull: false,
	},
	as: 'origin',
	onUpdate: 'CASCADE',
	onDelete: 'RESTRICT',
});
RelatedUser.belongsTo(User, {
	foreignKey: 'originUserId',
	as: 'origin',
});

User.hasMany(RelatedUser, {
	sourceKey: 'userId',
	foreignKey: {
		name: 'relatedUserId',
		allowNull: false,
	},
	as: 'related',
	onUpdate: 'CASCADE',
	onDelete: 'RESTRICT',
});
RelatedUser.belongsTo(User, {
	foreignKey: 'relatedUserId',
	as: 'related',
});

module.exports = RelatedUser;
