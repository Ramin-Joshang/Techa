// components/AccordionList.js
import { useState } from 'react';
import AccordionItem from './AccordionItem';

const AccordionList = ({ items }) => {
    const [openAccordion, setOpenAccordion] = useState(-1);

    const toggleAccordion = (index) => {
        setOpenAccordion(openAccordion === index ? -1 : index);
    };
    if (items) {

    }

    if (!items) {
        return <h1>چیزی نداریم</h1>
    }


    return (
        <div className="mt-5">

            {
                items.length == 0 ?
                    <h1>Loading ...</h1>
                    :
                    JSON.parse(items)?.map((item, index) => (
                        <>
                            <AccordionItem
                                key={item.Id}
                                title={item.Question}
                                content={item.Answer}
                                isOpen={openAccordion === index}
                                onClick={() => toggleAccordion(index)}
                            />
                        </>
                    ))}
        </div>
    );
};

export default AccordionList;
