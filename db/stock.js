var mongoose = require('mongoose');
var stockScheMa = new mongoose.Schema({
	code: {
		type: String,
		unique: true,
		required: true		
	},	
	name: {
		type: String
	},	
	pinyin: {
		type: String
	},
	tags: {
		type: [String],
		required: true		
	}
});
module.exports = mongoose.model('stock', stockScheMa);