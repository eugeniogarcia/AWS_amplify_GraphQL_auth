import React from 'react'
import Button from './Button'
import { styles, propiedadesSingUp } from './Form'

function SignUp({ updateFormState, signUp }: propiedadesSingUp){
    return (
        <div style={styles.container}>
            <input
                name='username'
                onChange={e => { e.persist(); updateFormState(e) }}
                style={styles.input}
                placeholder='username'
            />
            <input
                type='password'
                name='password'
                onChange={e => { e.persist(); updateFormState(e) }}
                style={styles.input}
                placeholder='password'
            />
            <input
                name='email'
                onChange={e => { e.persist(); updateFormState(e) }}
                style={styles.input}
                placeholder='email'
            />
            <Button onClick={signUp} title="Sign Up" />
        </div>
    )
}

export default SignUp