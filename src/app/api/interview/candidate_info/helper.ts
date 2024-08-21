import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../../../../../prisma";

const genAI = new GoogleGenerativeAI(process.env.BARD_API_KEY!);

export const generateInterview = async ({
  formData,
  interviewId,
}: {
  formData: any;
  interviewId: string;
}): Promise<boolean> => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const prompt = `Act as an interviewer for a top-tier tech company (Google, Meta, Microsoft, etc.). Based on the candidate's information provided below, generate at least 5 interview questions categorized into technical, situational, and behavioral categories. For each question:
                    Assign a numerical categoryCode:
                    0 for Technical (with a boolean codingRequired field).
                    1 for Situational.
                    2 for Behavioral.
                    Include the following candidate information to tailor the questions:
                    jsonCopy code
                    ${formData}
                    For each question, also provide:
                    A score (numeric value from 0 to 5) based on a sample candidate's response.
                    Key strengths and areas for improvement in the response.
                    Specific suggestions for enhancement.
                    The response should be an array of objects in JSON format as shown below:
                    jsonCopy code
                    [
                    {
                    "categoryCode": <numeric_value>,
                    "question": "<generated_question>",
                    "codingRequired": <true_or_false>, // Only for technical questions
                    "score": <numeric_value>,
                    "strengths": {
                    "<strength_key>": "<description>"
                    },
                    "areas_for_improvement": {
                    "<improvement_key>": "<description>"
                    },
                    "suggestions_for_improvement": {
                    "<suggestion_key>": "<description>"
                    }
                    }]
                   Ensure that:
                    At least 5 questions are generated.
                    Every key follows JSON naming conventions (e.g., camelCase, snake_case).
                    Do not include any backticks or spaces in the keys.`;

  try {
    const result = await model.generateContent([prompt]);
    console.log(
      "result",
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text!
    );
    const respForTreatment: [any] = JSON.parse(
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text!
    );

    const interviewIdPK = await prisma.interview.findUnique({
      where: {
        interview_id: interviewId,
      },
    });

    // Insert each question into the interview_question table
    respForTreatment.map(async (question) => {
      await prisma.interview_question.create({
        data: {
          interview_id: interviewIdPK?.id, // Use the actual interview ID
          question: question.question,
          answer: "", // Or use question.answer if provided
          submit_on: new Date(),
          categoryCode: question.categoryCode,
          codingRequired: question.codingRequired,
          score: question.score,
        },
      });
    });
    return Promise.resolve(true);
  } catch (error) {
    console.error(error);
    return Promise.resolve(false);
  }
};
