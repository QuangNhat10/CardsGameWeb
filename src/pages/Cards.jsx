import React from "react";
import MagicCards from "../components/MagicCards.jsx";

export default function Cards() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-8">
      <h1 className="text-2xl font-bold mb-6">Card Collection</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MagicCards />
        <MagicCards
          name="Flame Dragon"
          manaCost={["🔥", "🔥", "⚫", "2"]}
          imageUrl="https://placehold.co/300x200?text=Dragon"
          typeLine="Creature — Dragon"
          stats={{ atk: 7, def: 5 }}
          abilities={[
            "Flying",
            "When Flame Dragon enters the battlefield, it deals 3 damage to any target.",
          ]}
          variant="monster"
        />
        <MagicCards
          name="Dark Trap"
          manaCost={["⚫", "⚫"]}
          imageUrl="https://placehold.co/300x200?text=Trap"
          typeLine="Trap Card"
          stats={{ atk: 0, def: 0 }}
          abilities={["Activate when opponent attacks. Negate the attack."]}
          variant="trap"
        />
      </div>
    </div>
  );
}
