"use server";

import { getServerSession } from "next-auth";
import prisma from "../../../../../prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { redirect } from 'next/navigation'

const genAI = new GoogleGenerativeAI(process.env.BARD_API_KEY);

export async function setCandidateInfo(formData: any) {
  const session = await getServerSession();
  const name = session?.user?.name as string;
  try {
    const createdCandidate = await prisma.candidate_info.create({
      data: {
        name: name,
        yoe: parseInt(formData.yoe),
        currentRole: formData.current_role,
        desiredRole: formData.desired_role,
        programmingLanguages: formData.preferred_programming_lang.join(","),
        desiredCompanies: formData.desired_companies.join(","),
        technologiesUsed: formData.technologies_used.join(","),
        interviewId: formData.interview_id,
      },
    });
    if (createdCandidate) {
      generateInterview(formData);
    }
    // redirect(`/interview/${formData.interview_id}/?q=1`)
  } catch (e) {
    console.log(e);
  }
  return;
}

export const generateInterview = async (formData: any) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Imagine you are conducting an interview at a leading product-based company. Your goal is to provide helpful and safe responses, avoiding any content that is harmful, unethical, racist, sexist, toxic, dangerous, or illegal. Ensure your answers are socially unbiased and positive.You have scheduled an interview for the role of ${
    formData.desired_role
  }. The candidate currently serves as a ${
    formData.current_role
  } with a total work experience of ${
    formData.yoe
  } year. They prefer programming languages such as ${formData.preferred_programming_lang.join(
    ","
  )}. Their desired workplaces include ${formData.desired_companies.join(
    ","
  )}. Additionally, the candidate is familiar with technologies like ${formData.technologies_used.join(
    ","
  )}.Develop interview questions for this candidate, covering background, situation, technical, and coding aspects. Provide the responses in JSON format ,ensuring the format should be like this {  "interview_duration": 60"sections":[{"title":"""questions":[{"question":""}]}]} DO NOT INCLUDE BACKTICKS IN THE RESPONSE, including details such as interview duration, section titles, question weights, time required to answer, and individual questions. Avoid using generic information in the questions; make them specific to the candidate's profile.`;

  const result = await model.generateContent([prompt]);
  const respForTreatment: string | undefined =
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

  const dbData = createDBRowFromJSON(respForTreatment);

  function createDBRowFromJSON(jsonString: string) {
    const data = JSON.parse(jsonString);
    const rows: [] = [];
    data.sections.forEach((section: any) => {
      const category = section.title;
      if ("questions" in section) {
        section.questions.forEach((question: any) => {
          const questionText = question.question;
          rows.push({ category, questionText });
        });
      } else {
        const questionText = section.question;
        rows.push({ category, questionText });
      }
    });

    return rows;
  }

  dbData.map(async (d,index) => {
    await prisma.interview_question.create({
      data: {
        interviewId: formData.interview_id,
        time: 1,
        type: d.category,
        queston: d.questionText,
        questionId:index+1
      },
    });
  });
  return 
};
