import styled from "styled-components";

const theme: Record<string, any> = {
  blue: {
    default: "#3f51b5",
    hover: "#283593",
  },
  pink: {
    default: "#e91e63",
    hover: "#ad1457",
  },
  green: {
    default: "#4caf50",
    hover: "#2e7d32",
  },
};

const Button = styled.button<{ $theme: string }>`
  background-color: ${(props) => theme[props.$theme].default};
  color: white;
  padding: 5px 15px;
  border-radius: 5px;
  outline: 0;
  border: 0;
  text-transform: uppercase;
  margin: 10px 0px;
  cursor: pointer;
  transition: ease background-color 250ms;
  &:hover {
    background-color: ${(props) => theme[props.$theme].hover};
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

Button.defaultProps = {
  $theme: "blue",
};

export default Button;
