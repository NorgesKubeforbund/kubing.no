import React from "react";
import ContactForm from "../components/ContactForm";
import "./OmOss.css";
import { Link } from "react-router-dom";
import BrregMembers from "../components/BrregMembers";

function OmOss(): React.ReactElement<any, any> {
  return (
    <div className="OmOss">
      <div className="Main">
        <div className="intro">
          <h1 className="MainHeader">Om Oss</h1>
          Norges kubeforbund jobber med å fremme interessen for løsing av Rubiks
          kube og andre lignende puslespill i Norge. Dette gjøres ved å
          arrangere konkurranser og bidra til å skape et sosialt miljø. Om du
          synes dette høres spennende ut, kan du bli medlem eller finne et
          lokalt miljø å bli kjent med. Du kan medlem deg inn{" "}
          <Link to="/BliMedlem">her</Link> og finne en oversikt over lokale
          kubemiljø <Link to="/Ressurser/LokaleArrangement">her.</Link>
          <br></br>
        </div>
        <div className="element">
          <h2>Styret</h2>
          <div className="brreg">
            {/* {BrregMembers()} */}
            <BrregMembers/>
          </div>
        </div>
        <div id="kontaktOss">
          <ContactForm serviceID={"service_onnkkgn"} />
        </div>
        <br></br>
        <br></br>
      </div>
    </div>
  );
}

export default OmOss;
