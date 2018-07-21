var _ = require('lodash');

// This role level and above is allowed

module.exports = function(roleLevels) {
	return {
		// Has access
		ha: function(allowedRole, userRole) {
			var allowedRoleInt = _.isNumber(allowedRole) ? allowedRole : roleLevels[allowedRole];
			var userRoleInt = _.isNumber(userRole) ? userRole : roleLevels[userRole];

			return allowedRoleInt >= userRoleInt;
		}
	}
}