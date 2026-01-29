import joi from "joi";

export const createsubCategorySchema={
    body: joi.object({
        name:joi.string().min(4).max(20),
            
    }    
).required().options({presence:'required'}),
}