import { Link } from "react-router-dom";

export default function LoginPage() {

  return (
    <div>
      <h1>Home Page</h1>
        <Link to="/2fa-enrolment-request">
          Set up 2FA
        </Link> 
    </div>
  )
}