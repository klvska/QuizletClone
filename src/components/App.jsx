import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./organisms/Header";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import AddSetForm from "./organisms/AddSetForm";
import Sets from "./pages/Sets/Sets";
import Quiz from "./pages/Quiz/Quiz";
import UserStats from "./pages/UserStats/UserStats";
import Learn from "./pages/Learn/Learn";
import Results from "./pages/Results/Results";
import TestConfig from "./pages/TestConfig/TestConfig";
import Test from "./pages/Test/Test.jsx";

const App = () => {
  const userId = parseInt(localStorage.getItem("userId"));
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route
          path="/add-set"
          element={<AddSetForm userId={userId} onSetAdded={() => {}} />}
        />
        <Route path="/sets/:setId" element={<Sets />} />
        <Route path="/sets/:setId/learn" element={<Learn />} />
        <Route path="/sets/:setId/results" element={<Results />} />
        <Route path="/sets/:setId/test-config" element={<TestConfig />} />
        <Route path="/sets/:setId/test" element={<Test />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
        <Route path="/stats" element={<UserStats />} />
      </Routes>
    </Router>
  );
};

export default App;
