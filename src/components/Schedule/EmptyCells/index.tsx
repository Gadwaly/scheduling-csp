const EmptyCells = (count: number) => {
	return (
		<>
			{[...Array(count)].map((value: undefined, index: number) => {
				return <td key={index}></td>;
			})}
		</>
	);
};

export default EmptyCells;
