"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addStudentAndMarkPresent(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const dob = formData.get("dob") as string;
  const address = formData.get("address") as string;
  const occupation = formData.get("occupation") as string;
  const sessionId = formData.get("sessionId") as string;
  const photo = formData.get("photo") as File | null;

  let photo_url: string | null = null;

  if (photo && photo.size > 0) {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("student_photos")
      .upload(fileName, photo, { contentType: "image/jpeg" });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("student_photos")
      .getPublicUrl(fileName);

    photo_url = urlData.publicUrl;
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({ name, dob: dob || null, address, occupation, photo_url })
    .select()
    .single();

  if (studentError) throw studentError;

  const { error: attendanceError } = await supabase
    .from("attendance")
    .insert({ session_id: sessionId, student_id: student.id });

  if (attendanceError) throw attendanceError;

  revalidatePath("/");
}

export async function markExistingStudentPresent(
  studentId: string,
  sessionId: string,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("attendance")
    .insert({ session_id: sessionId, student_id: studentId });

  if (error && error.code !== "23505") throw error; // ignore "already marked" duplicate error

  revalidatePath("/");
}

export async function searchStudents(query: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("students")
    .select("id, name, photo_url, occupation")
    .ilike("name", `%${query}%`)
    .limit(10);

  return data || [];
}

export async function updateStudent(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const dob = formData.get("dob") as string;
  const address = formData.get("address") as string;
  const occupation = formData.get("occupation") as string;
  const photo = formData.get("photo") as File | null;

  const updates: any = { name, dob: dob || null, address, occupation };

  if (photo && photo.size > 0) {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("student_photos")
      .upload(fileName, photo, { contentType: "image/jpeg" });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage
      .from("student_photos")
      .getPublicUrl(fileName);
    updates.photo_url = urlData.publicUrl;
  }

  const { error } = await supabase
    .from("students")
    .update(updates)
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/students");
}

export async function removeAttendance(sessionId: string, studentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("session_id", sessionId)
    .eq("student_id", studentId);
  if (error) throw error;
  revalidatePath("/");
}
