const EmptyCells = (count: number) => {
  if (count < 0) return null;
  return (
    <>
      {[...Array(count)].map((value: undefined, index: number) => {
        return <td key={index}></td>;
      })}
    </>
  );
};

export default EmptyCells;
