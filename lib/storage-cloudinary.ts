import { v2 as cloudinary } from 'cloudinary';

const CLOUD = process.env.CLD_CLOUD_NAME!;
const KEY = process.env.CLD_API_KEY!;
const SECRET = process.env.CLD_API_SECRET!;
if (!CLOUD || !KEY || !SECRET) {
  throw new Error('Cloudinary env missing: CLD_CLOUD_NAME / CLD_API_KEY / CLD_API_SECRET');
}

cloudinary.config({
  cloud_name: CLOUD,
  api_key: KEY,
  api_secret: SECRET,
  secure: true,
});

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
}

interface AvatarPayload {
  name: string;
  data: Buffer;
  type: string;
}

const MAX_AVATAR_BYTES = 6 * 1024 * 1024; // 6 MB

/** Upload avatar via data URI. Returns Cloudinary public_id (includes folder path). */
export async function saveUserAvatarCloudinary(userId: string, file: AvatarPayload) {
  if (!file?.name) throw new Error('no file');
  if (file.data.length > MAX_AVATAR_BYTES) throw new Error('too big'); // 6 MB guard

  const base = sanitize(file.name.replace(/\.[^.]+$/,''));
  const folder = `anubis/users/${userId}`;
  const publicId = `${Date.now()}-${base}`; // full path will be folder/publicId

  const mime = file.type || 'application/octet-stream';
  const dataUri = `data:${mime};base64,${file.data.toString('base64')}`;

  const res = await cloudinary.uploader.upload(dataUri, {
    folder,                 // ensures assets live under anubis/users/<userId>/
    public_id: publicId,    // final public_id = `${folder}/${publicId}`
    resource_type: 'image',
    overwrite: true,
    unique_filename: false,
    invalidate: true,
    allowed_formats: ['jpg','jpeg','png','gif','webp'],
  });

  return res.public_id;     // e.g. "anubis/users/<userId>/169...-name"
}

/** Build avatar URL with transformations. */
export function avatarUrl(publicId: string, size = 96) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,c_fill,g_face,r_max,w_${size},h_${size}/${publicId}`;
}

/** Delete a Cloudinary asset by public_id (used to prune old avatars). */
export async function destroyAsset(publicId: string) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch {
    // ignore best-effort deletion errors
  }
}
