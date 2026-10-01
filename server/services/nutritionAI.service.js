const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


async function analyzeMealImage(imagePath, mimeType, mealName) {

    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');


    const interaction = await ai.interactions.create({

        model: 'gemini-3.5-flash-lite',

        input: [

            {
                type: 'image',
                mime_type: mimeType,
                data: base64Image
            },

            {
                type: 'text',
                text: `
                    נתח את הארוחה שבתמונה.

                    שם הארוחה שהמשתמש הזין:
                    ${mealName}

                    הערך את הכמות הנראית בתמונה
                    והחזר הערכה תזונתית עבור כל הארוחה.

                    חשוב:
                    הערכים הם הערכה בלבד לפי התמונה,
                    ולא מדידה מדויקת.
                `
            }

        ],

        response_format: {

            type: 'text',
            mime_type: 'application/json',

            schema: {

                type: 'object',

                properties: {

                    mealName: {
                        type: 'string'
                    },

                    calories: {
                        type: 'number'
                    },

                    protein: {
                        type: 'number'
                    },

                    carbs: {
                        type: 'number'
                    },

                    fats: {
                        type: 'number'
                    }

                },

                required: [
                    'mealName',
                    'calories',
                    'protein',
                    'carbs',
                    'fats'
                ]

            }

        },

        store: false
    });


    return JSON.parse(interaction.output_text);
}


module.exports = {
    analyzeMealImage
};