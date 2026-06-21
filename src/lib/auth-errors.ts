const AUTH_ERROR_ID: Record<string, string> = {
  "Invalid login credentials": "Email atau password salah.",
  "Email not confirmed": "Email belum dikonfirmasi. Cek inbox kamu.",
  "User already registered": "Email sudah terdaftar. Coba masuk.",
  "Password should be at least 6 characters":
    "Password minimal 6 karakter.",
  "Signup requires a valid password": "Password tidak valid.",
  "Unable to validate email address: invalid format":
    "Format email tidak valid.",
};

export function translateAuthError(message: string): string {
  return AUTH_ERROR_ID[message] ?? message;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password minimal 8 karakter.";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Masukkan alamat email yang valid.";
  }
  return null;
}
