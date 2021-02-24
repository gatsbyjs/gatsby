import React from 'react';
import { renderHTML } from '../agility/utils'

const RichTextArea = ({ item }) => {

    return (
        <section className="container">
            <div dangerouslySetInnerHTML={renderHTML(item.customFields.textblob)}></div>
        </section>
    );
}

export default RichTextArea;
