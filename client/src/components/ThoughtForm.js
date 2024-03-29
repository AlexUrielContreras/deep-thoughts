import { useState } from 'react';

import { useMutation } from '@apollo/client';
import { QUERY_THOUGHTS, QUERY_ME } from '../utils/queries';
import { ADD_THOUGHT } from '../utils/mutations'

const ThoughtForm = () => {

    const [ addThought , {error}] = useMutation(ADD_THOUGHT, {
        update(cache, { data: {addThought}}) {
            try {
                const { me } = cache.readQuery({ query: QUERY_ME});
                cache.writeQuery({
                    query: QUERY_ME,
                    data: { me: { ...me, thoughts: [...me.thoughts, addThought]}}
                })
            } catch (e) {
                console.warn('First thought insertion by user!')
            }
            
            // read what currently in the cache 
            const { thoughts } = cache.readQuery({ query: QUERY_THOUGHTS});

            // prepend the newest thought to the front of the array 
            cache.writeQuery({
                query: QUERY_THOUGHTS, 
                data: { thoughts: [addThought, ...thoughts]}
            })
        }
    });
    const [thoughtText, setText] = useState('');
    const [characterCount, setCharacterCount] = useState(0);


    const handleChange = event => {
        if (event.target.value.length <= 280) {
            setText(event.target.value);
            setCharacterCount(event.target.value.length)
        }
    }

    const handleFormSubmit = async event => {
        event.preventDefault();

        try {
            
            await addThought({
                variables: { thoughtText } 
            })

            setText('');
            setCharacterCount(0)
        } catch (e) {
            console.error(e)
        }
    } 

    return (
        <div>
            <p className={`m-0 ${characterCount === 280 || error ? 'text-error' : ''} `}>
                Character Count: {characterCount}/280
                {error && <span className='ml-2'>Something went wrong....</span>}
            </p>
            <form className='flex-row justify-center justify-space-between-md align-stretch' onSubmit={handleFormSubmit}>
                <textarea placeholder="Here's a new thought... " value={thoughtText} onChange={handleChange} className='form-input col-12 col-md-3 col-md-9'></textarea>
                <button className='btn col-12 col-md-3' type='submit'>Submit</button>
            </form>
        </div>
    )
};

export default ThoughtForm;