export const vocabularyTerms = [
    {
        term: 'Secession',
        definition: 'When a state officially leaves or withdraws from the United States. Southern states seceded to form the Confederacy.'
    },
    {
        term: 'Abolitionist',
        definition: 'A person who wanted to end (abolish) slavery. Many abolitionists helped enslaved people escape through the Underground Railroad.'
    },
    {
        term: 'Confederacy',
        definition: 'The Confederate States of America - 11 Southern states that left the Union to form their own country from 1861-1865.'
    },
    {
        term: 'Union',
        definition: 'The United States of America, specifically the Northern states that fought to keep the country together during the Civil War.'
    },
    {
        term: 'Emancipation',
        definition: 'The act of freeing someone from slavery. The Emancipation Proclamation of 1863 declared enslaved people in Confederate states to be free.'
    },
    {
        term: 'Cavalry',
        definition: 'Soldiers who fight on horseback. Cavalry units were used for scouting, raids, and fast attacks during the Civil War.'
    },
    {
        term: 'Infantry',
        definition: 'Soldiers who fight on foot. Most Civil War soldiers were infantry, carrying rifles and marching long distances.'
    },
    {
        term: 'Blockade',
        definition: 'Using ships to prevent supplies from entering or leaving ports. The Union blockaded Southern ports to weaken the Confederacy.'
    }
];

export function getVocabHTML() {
    return vocabularyTerms.map(v =>
        `<li class="vocab-item">
            <div class="vocab-term-name">${v.term}</div>
            <div class="vocab-definition-text">${v.definition}</div>
        </li>`
    ).join('');
}
