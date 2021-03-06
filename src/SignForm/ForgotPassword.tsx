import React from 'react'
import Button from './Button'
import { styles, propiedadesForgotPassword } from './Form'

function ForgotPassword(props: propiedadesForgotPassword) {
    return (
        <div style={styles.container}>
            <input
                name='username'
                placeholder='Username'
                onChange={e => { e.persist(); props.updateFormState(e) }}
                style={styles.input}
            />
            <Button onClick={props.forgotPassword} title="Reset password" />
        </div>
    )
}

export default ForgotPassword