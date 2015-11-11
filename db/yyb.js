var mongoose = require('mongoose');
var stockScheMa = new mongoose.Schema({
	date: {
        type: Date,
        default: Date.now,
        get: function(val) {
            if (!val) return val;
            return val.getYear() + "/" + (val.getMonth() + 1) + "/" + val.getDate();
        }
	},	
	name: {
		type: String,
		required: true
	},
	code: {
		type: String,
		required: true		
	},	
	buyNum: {
		type: Number,
		required: true		
	},	
	sellNum: {
		type: Number,
		required: true		
	}
});
module.exports = mongoose.model('yyb', stockScheMa);