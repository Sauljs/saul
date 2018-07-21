module.exports = (mongoose) => {
	return (apiObj) => {
		var obj = apiObj.fields;
		var schema;

		if (apiObj.settings) {
			schema = new mongoose.Schema(obj, apiObj.settings);
		} else {
			schema = new mongoose.Schema(obj);
		}

		return mongoose.model(apiObj.apiName, schema);
	}
}