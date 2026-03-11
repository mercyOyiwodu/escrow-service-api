exports.validate = async (data, schema) => {
    return await schema.validateAsync(data, { abortEarly: false });
};