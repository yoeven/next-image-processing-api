import { NextPage } from "next";
import { transformImage } from "src/photon/client";

const Home: NextPage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 20,
      }}
    >
      <h1>Next Image Processing</h1>

      <img
        src={transformImage({
          url: "/testimage.jpg",
          width: 500,
          format: "webp",
          fit: "contain",
        })}
        alt="Huge Image"
        style={{
          maxWidth: "100%",
        }}
      />
    </div>
  );
};

export default Home;
