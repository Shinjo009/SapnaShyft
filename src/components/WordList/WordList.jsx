const WordList = ({
  words,
  activeIndex,
  fontSize = 48,
  lineHeight = 55,
  gap = 0,
  letterSpacing = 0.24,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
      {words.map((word, index) => (
        <span
          key={word}
          className="word-item"
          style={{
            color: index === activeIndex ? '#EEE' : 'rgba(184, 184, 184, 0.50)',
            fontFamily: 'Lato',
            fontSize: `${fontSize}px`,
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: `${lineHeight}px`,
            letterSpacing: `${letterSpacing}px`,
            transition: 'color 0.3s ease-out',
            position: 'relative',
            zIndex: index === activeIndex ? 20 : 0,
            textShadow:
              index === activeIndex
                ? `
                  0 0 20px rgba(255, 255, 255, 0.6),
                  0 0 40px rgba(255, 255, 255, 0.4),
                  0 0 60px rgba(255, 255, 255, 0.2)
                `
                : 'none',
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

export default WordList;
