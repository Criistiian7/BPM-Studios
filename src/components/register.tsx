import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  FormLabel,
  FormControl,
  FormGroup,
  Alert,
} from "react-bootstrap";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (firebaseError: any) {
      console.error("Registration failed", firebaseError);
      setError(firebaseError.message);
    }
  };

  return (
    <Container className="mb-5">
      <h2 className="mb-4">Register</h2>
      {error && <Alert variant="danger">{error}</Alert>} {/* Show error*/}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <FormLabel>Email address</FormLabel>
          <FormControl
            type="email"
            placeholder="Enter email...please"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            required
          />
        </Form.Group>

        <FormGroup className="mb-3" controlId="formBasicPassword">
          <FormLabel>Password</FormLabel>
          <FormControl
            type="password"
            placeholder="Password...please"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            required
          />
        </FormGroup>

        <Button variant="primary" type="submit">
          Register
        </Button>
      </Form>
    </Container>
  );
}

export default Register;
