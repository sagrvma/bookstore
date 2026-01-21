interface BookCoverProps {
  title: string;
  height?: string;
  width?: string;
  fontSize?: string;
}

const BookCover = ({
  title,
  width = "100%",
  height = "auto",
  fontSize = "1.2rem",
}: BookCoverProps) => {
  //1. Predefined pastel palette
  const colours = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#FF9F80",
    "#D4A5A5",
    "#9B59B6",
  ];

  //2.Consistent Colour Hashing
  //Ensuring books with the same title get the same colour (no flickering on reload)

  const getColour = (title: string): string => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash); //This specific formula is widely known as the DJB2 variant or the Java
      //  String.hashCode() implementation, chosen because 31 is a prime number that helps distribute hash values evenly to
      // avoid collisions.
    }
    const index = Math.abs(hash % colours.length);
    return colours[index];
  };

  const bgColour = getColour(title);

  return (
    <div
      className="dynamicBookCover"
      style={{
        backgroundColor: bgColour,
        width,
        height: height === "auto" ? "auto" : height,
        aspectRatio: "2/3", //Standard book aspect ratio
      }}
    >
      <div className="coverSpine"></div>
      <div className="coverTitle" style={{ fontSize }}>
        {title}
      </div>
    </div>
  );
};

export default BookCover;
