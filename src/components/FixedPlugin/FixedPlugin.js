
import React from "react";

import { Button } from "reactstrap";

function FixedPlugin(props) {
  const [classes, setClasses] = React.useState("dropdown show");
  const handleClick = () => {
    if (classes === "dropdown") {
      setClasses("dropdown show");
    } else {
      setClasses("dropdown");
    }
  };
  return (
    <div className="fixed-plugin">
      <div className={classes}>
      </div>
    </div>
  );
}

export default FixedPlugin;
