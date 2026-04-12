
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/authContext";
import { useThemeStore } from "../store/useThemeStore";

function ProfilePage() {

  const { authUser, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  
  const btnTextColor = ["coal", "titanium", "steel"].includes(theme) ? "!text-black" : "!text-white";

  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!selectedImg) {
      await updateProfile({
        fullName: name,
        bio
      });

      navigate("/");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);

    reader.onload = async () => {
      await updateProfile({
        profilePic: reader.result,
        fullName: name,
        bio
      });

      navigate("/");
    };
  };

  return (

    <div className="min-h-full flex items-center justify-center px-4 bg-[var(--bg)] text-[var(--text)]">

      <div className="saas-panel w-full max-w-3xl p-6 flex flex-col md:flex-row gap-6">

        {/* FORM */}
        <form onSubmit={submitHandler} className="flex-1 flex flex-col gap-5">

          <h2 className="text-3xl font-black text-[var(--primary)]">
            My Profile
          </h2>

          {/* AVATAR UPLOAD */}
          <label
            htmlFor="avatar"
            className="flex items-center gap-4 cursor-pointer font-bold"
          >

            <input
              id="avatar"
              type="file"
              hidden
              accept=".png,.jpg,.jpeg"
              onChange={(e) => setSelectedImg(e.target.files[0])}
            />

            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : authUser?.profilePic || assets.avatar_icon
              }
              className="w-16 h-16 rounded-full border-4 border-[var(--text)] hover:ring-4 hover:ring-[var(--primary)]"
              alt="Avatar preview"
            />

            Upload avatar

          </label>

          {/* NAME */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
            className="saas-input"
          />

          {/* BIO */}
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
            rows={4}
            placeholder="Write something fun about you"
            className="saas-input rounded-3xl"
          />

          {/* SAVE BUTTON */}
          <button
            type="submit"
            className={`saas-btn bg-[var(--primary)] ${btnTextColor} hover:brightness-110 w-full`}
          >
            Save Changes
          </button>

        </form>

        {/* PREVIEW */}
        <div className="flex flex-col items-center justify-center gap-3">

          <img
            src={
              selectedImg
                ? URL.createObjectURL(selectedImg)
                : authUser?.profilePic || assets.avatar_icon
            }
            className="w-32 h-32 rounded-full border-4 border-[var(--text)] shadow-[8px_8px_0px_var(--text)]"
            alt="Current avatar preview"
          />

          <p className="font-extrabold text-lg">
            {name || "User"}
          </p>

          <p className="font-bold text-center text-sm max-w-[200px] text-[var(--muted)]">
            {bio || "Your bio will appear here"}
          </p>

        </div>

      </div>

    </div>

  );
}

export default ProfilePage;

