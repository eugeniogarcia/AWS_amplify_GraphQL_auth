import React from 'react'
import Button from './Button'
import { styles, propiedadesConfirmSignUp } from './Form'

function ConfirmSignUp(props: propiedadesConfirmSignUp) {
    return (
        <div style={styles.container}>
            <input
                name='confirmationCode'
                placeholder='Confirmation Code'
                onChange={e => { e.persist(); props.updateFormState(e) }}
                style={styles.input}
            />
            <Button onClick={props.confirmSignUp} title="Confirm Sign Up" />
        </div>
    )
}

export default ConfirmSignUp