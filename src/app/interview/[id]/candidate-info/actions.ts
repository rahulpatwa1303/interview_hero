"use server";

export async function setCandidateInfo(id: string, formData: FormData) {
  const name = formData?.get("name");
  const yoe = formData?.get("yoe");
  const current_role = formData?.get("current_role");
  const desired_role = formData?.get("desired_role");
  const preferredProgrammingLang = formData.getAll("preferred_programming_lang");
  const technologies_used = formData?.get("technologies_used");

  // console.log('technologies_used',preferred_programming_lang)
  
  console.log("formData", preferredProgrammingLang);
  console.log("formData", formData);
}
