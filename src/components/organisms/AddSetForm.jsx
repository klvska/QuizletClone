import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import { FaPlus, FaCog, FaRandom } from "react-icons/fa";
import "./AddSetForm.css";

const AddSetForm = ({ userId, onSetAdded }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [cards, setCards] = useState([
    { question: "", answer: "", hint: "", difficulty: 1 },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3001/sets",
        {
          title,
          description,
          isPublic,
          userId,
          cards,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onSetAdded(response.data);
      navigate(`/sets/${response.data.id}`);
    } catch (error) {
      console.error("Error creating set:", error);
    }
  };

  const addCard = () => {
    setCards([...cards, { question: "", answer: "", hint: "", difficulty: 1 }]);
  };

  const removeCard = (index) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const updateCard = (index, field, value) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  return (
    <div className="min-h-screen bg-[#0a092d] text-white p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Stwórz nowy zestaw fiszek</h1>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-[#2e3856] rounded-lg hover:bg-[#4255ff] transition-colors"
            >
              Stwórz
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-[#2e3856] rounded-xl p-6 mb-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Wpisz tytuł, na przykład "Biologia - Rozdział 22: Ewolucja"'
              className="w-full bg-[#1a1d28] text-white p-4 rounded-lg text-lg mb-6 outline-none border-2 border-transparent focus:border-[#4255ff] transition-colors"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dodaj opis..."
              className="w-full bg-[#1a1d28] text-white p-4 rounded-lg resize-none h-32 outline-none border-2 border-transparent focus:border-[#4255ff] transition-colors mb-4"
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="isPublic">Zestaw publiczny</label>
            </div>
          </div>

          <div className="space-y-4">
            {cards.map((card, index) => (
              <div key={index} className="bg-[#2e3856] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeCard(index)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    Usuń
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={card.question}
                      onChange={(e) =>
                        updateCard(index, "question", e.target.value)
                      }
                      placeholder="POJĘCIE"
                      className="w-full bg-[#1a1d28] text-white p-4 rounded-lg outline-none border-2 border-transparent focus:border-[#4255ff] transition-colors"
                    />
                    <input
                      type="text"
                      value={card.hint}
                      onChange={(e) =>
                        updateCard(index, "hint", e.target.value)
                      }
                      placeholder="PODPOWIEDŹ (opcjonalnie)"
                      className="w-full bg-[#1a1d28] text-white p-4 rounded-lg outline-none border-2 border-transparent focus:border-[#4255ff] transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={card.answer}
                      onChange={(e) =>
                        updateCard(index, "answer", e.target.value)
                      }
                      placeholder="DEFINICJA"
                      className="w-full bg-[#1a1d28] text-white p-4 rounded-lg outline-none border-2 border-transparent focus:border-[#4255ff] transition-colors"
                    />
                    <select
                      value={card.difficulty}
                      onChange={(e) =>
                        updateCard(
                          index,
                          "difficulty",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full bg-[#1a1d28] text-white p-4 rounded-lg outline-none border-2 border-transparent focus:border-[#4255ff] transition-colors"
                    >
                      <option value={1}>Łatwy</option>
                      <option value={2}>Średni</option>
                      <option value={3}>Trudny</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={addCard}
                className="flex items-center gap-2 px-4 py-2 bg-[#4255ff] text-white rounded-lg hover:bg-[#2b3bcc] transition-colors"
              >
                <FaPlus /> Dodaj kartę
              </button>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                className="p-2 bg-[#2e3856] rounded-lg hover:bg-[#4255ff] transition-colors"
              >
                <FaCog />
              </button>
              <button
                type="button"
                className="p-2 bg-[#2e3856] rounded-lg hover:bg-[#4255ff] transition-colors"
              >
                <FaRandom />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

AddSetForm.propTypes = {
  userId: PropTypes.number.isRequired,
  onSetAdded: PropTypes.func.isRequired,
};

export default AddSetForm;
