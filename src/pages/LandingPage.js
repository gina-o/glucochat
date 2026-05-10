import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate("/social");
  };

  return (
    <div className="h-screen flex items-center justify-center">
      {/* Clickable glowing image */}
      <button onClick={handleEnter} className="group">
        <img
          src={process.env.PUBLIC_URL + "/logo375.png"}
          alt="Enter App"
          className="
            w-64
            rounded-xl 
            transition 
            duration-300 
            group-hover:scale-110
            drop-shadow-[0_0_25px_rgba(0,200,255,0.75)]
          "
        />
      </button>
    </div>
  );
}

export default LandingPage;

