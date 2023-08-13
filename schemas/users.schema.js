const Joi = require("joi");

const userSchema = Joi.object({
    email: Joi
        .string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({ 'any.required': "missing required email field" }),
    password: Joi
        .string()
        .min(8)
        .max(10)
        .required()
        .messages({
            'any.required': "missing required password field"
        }),
})

const userByFieldSchema = (fieldName) => {
    const result = userSchema
        .fork(Object.keys(userSchema.describe().keys), (schema) => schema.optional())
        .fork(fieldName, (schema) => schema.required().messages({
            'any.required': `missing required ${fieldName} field`
        }))

    return result
}


module.exports = { userSchema, userByFieldSchema }