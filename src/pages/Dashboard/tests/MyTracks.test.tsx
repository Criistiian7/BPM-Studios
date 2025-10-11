import { render, screen } from "@testing-library/react";
import MyTracks from "../MyTracks";
import { AuthProvider } from "../../../context/authContext";

test("renders MyTracks and adds new track", async () => {
  render(
    <AuthProvider>
      <MyTracks />
    </AuthProvider>
  );
  expect(screen.getByText(/Piesele mele/i)).toBeInTheDocument();
});
