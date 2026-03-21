import ScreenCard from './ScreenCard.jsx';

export default function ScreenList({ screens, selectedScreenId, onSelectScreen }) {
  return (
    <div className="screen-list">
      <h2>Screens</h2>
      <div className="screen-list-items">
        {screens.map((screen) => (
          <ScreenCard
            key={screen.id}
            screen={screen}
            isSelected={screen.id === selectedScreenId}
            onSelect={() => onSelectScreen(screen.id)}
          />
        ))}
      </div>
    </div>
  );
}
