import ForgotPassword from "@/components/Auth/ForgotPassword";
import { useGlobalContext } from "../Context/GlobalContext";

export default function ForgotPage() {
  const { requestPasswordReset } = useGlobalContext();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <ForgotPassword onRequestReset={requestPasswordReset} />
    </main>
  );
}
