import React from 'react';
import ContentZone from '../agility/components/ContentZone'

const OneColumnTemplate = (props) => {
	return (
		<div className="one-column-template">
			<ContentZone name="Main" {...props} />
		</div>
	);
}
export default OneColumnTemplate;
