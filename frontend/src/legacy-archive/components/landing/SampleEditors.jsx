"use client"
import Image from 'next/image';
import React, { useState } from 'react';
import CodePreview from "../inline/previews/CodePreview"
const SampleEditor = () => {

    const [activeTab, setActiveTab] = useState(2);
    const htmlCode = `<h1>Hello World</h1>
    <p>This is a simple HTML example demonstrating a list.</p>
<ul>
    <li>Item 1: Description of item 1.</li>
    <li>Item 2: Description of item 2.</li>
    <li>Item 3: Description of item 3.</li>
    <li>Item 4: Description of item 4.</li>
    <li>Item 5: Description of item 5.</li>
</ul>
<footer>Footer content here.</footer>`;

    const jsCode = `
const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
items.forEach((item, index) => {
    
});
const sum = (a, b) => a + b;
`;

    const reactCode = `const MyComponent = () => {
    const [count, setCount] = useState(0);
    return (
        <div>
            <h2>Hello from React!</h2>
            <p>This is a simple React component with state.</p>
            <button onClick={() => setCount(count + 1)}>Increase Count</button>
            <p>Current Count: {count}</p>
        </div>
    );
};`;

    const tabContent = [
        {
            id: 0, title: "HTML",
            content: <CodePreview code={htmlCode} language="html" />
        },
        {
            id: 1, title: "JS", content: <CodePreview code={jsCode} language="javascript" />
        },
        {
            id: 2, title: "React", content: <CodePreview code={reactCode} language="javascript" />
        },
    ];

    return (
        <div className="bg-[#fff5e0] py-10">
            <div className="container mx-auto px-5 2xl:px-20">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    <div className="relative w-full pb-[60%] lg:mt-0 order-2 lg:order-1">
                        <Image
                            src="/images/Editor.png"
                            fill
                            style={{ objectFit: "cover" }}
                            alt="banner"
                        />                    </div>
                    <div className='text-[#042A1B] w-full order-1'>
                        <div className="w-full">
                            <div className='flex flex-col sm:flex-row gap-5 justify-between items-center'>
                                <h1 className='text-4xl font-extrabold '>ادیتور برخط</h1>
                                <div className="flex flex-row-reverse space-x-1 bg-[#F6DC6533] p-1.5 rounded-full">
                                    {tabContent.map((tab, index) => (
                                        <button
                                            key={index}
                                            className={`py-2 px-5 text-xl font-medium text-[#042A1B] rounded-full transition duration-300 ${activeTab !== index ? 'bg-transparent' : 'bg-[#F6DC65] font-semibold'
                                                }`}
                                            onClick={() => setActiveTab(index)}
                                        >
                                            {tab.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="my-5 rounded-xl overflow-hidden">
                                {tabContent.map((tab, index) => (
                                    <div
                                        key={index}
                                        className={`transition-opacity duration-300 ${activeTab === index ? 'block' : 'hidden'}`}
                                    >
                                        {tab.content}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div >
            </div >
        </div >
    );
};

export default SampleEditor;
