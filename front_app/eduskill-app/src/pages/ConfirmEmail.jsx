import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../apis/interceptors/axios";

export function Component() {
  const { key } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        await apiClient.post(`/auth/register/account-confirm-email/`, {
          key: key,
        });
        setStatus("success");
        // Redirect after a short delay to show success message
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (error) {
        console.error("Email confirmation failed:", error);
        setStatus("error");
      }
    };

    confirmEmail();
  }, [key, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          {status === "verifying" && (
            <>
              <h2 className="card-title">Verifying Your Email</h2>
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p>Please wait while we verify your email address...</p>
            </>
          )}

          {status === "success" && (
            <>
              <h2 className="card-title text-success">Email Verified!</h2>
              <div className="text-5xl">✓</div>
              <p>
                Your email has been successfully verified. Redirecting to home
                page...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <h2 className="card-title text-error">Verification Failed</h2>
              <div className="text-5xl">✗</div>
              <p>
                Sorry, we couldn&apos;t verify your email. The link may be
                invalid or expired.
              </p>
              <button className="btn btn-primary" onClick={() => navigate("/")}>
                Go to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
