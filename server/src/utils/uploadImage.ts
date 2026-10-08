import supabase from "../config/supabase";

async function uploadImage(image: Buffer) {

  const fileName = `message-${Date.now()}.jpg`;

//   .upload() function returns one object and that both object contains both data and error thats why we are taking error out of here 
  const { error } = await supabase.storage
    .from("imagebucket")
    .upload(fileName, image, {
      contentType: "image/jpeg",
    });
  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
  const { data } = supabase.storage
    .from("imagebucket")
    .getPublicUrl(fileName);
  return data.publicUrl;
}

export default uploadImage;