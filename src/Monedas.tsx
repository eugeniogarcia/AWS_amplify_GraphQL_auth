import React, { useEffect, useReducer, FunctionComponent } from 'react'
import { RouteComponentProps } from 'react-router-dom';
import './Monedas.css';

import API, { graphqlOperation } from '@aws-amplify/api'
import { listNotes } from './graphql/queries'
import { updateNote as UpdateNote, createNote as CreateNote, deleteNote as DeleteNote } from './graphql/mutations'
import { onCreateNote } from './graphql/subscriptions'

import { Input, List, Button } from 'antd'
import 'antd/dist/antd.css'
import { uuid } from 'uuidv4';
import CSS from 'csstype';

import { Auth } from 'aws-amplify'

//En styles definimos varios elementos, todos ellos contendran uno o varios estilos, por eso los definimos como CSS.Properties
const styles = {
  container: { padding: '20', margin: '0' } as CSS.Properties,
  input: { marginBottom: '10' } as CSS.Properties,
  item: { textAlign: 'left' } as CSS.Properties,
  p: { color: '#1890ff' } as CSS.Properties
}

//Tipos
type nota = {
  id?: string 
  clientId: string
  name: string
  description?: string
  completed?: boolean
}

type estado={
  notes: nota[],
  loading: boolean,
  error: boolean,
  form: { name: string, description: string }
}

type accion=
  {
    type: 'ERROR' | 'RESET_FORM'
  } |
  {
    type: 'SET_INPUT'
    name: string,
    value:string
  } |
  {
    type: 'ADD_NOTE'
    note: nota,
  } |
  {
    type: 'SET_NOTES'
    notes: nota[],
  } 
  
//Estado inicial
const initialState: estado = {
  notes: [],
  loading: true,
  error: false,
  form: { name: '', description: '' }
}

const CLIENT_ID = uuid()

//Definimos el reducer como una función del tipo React.Reducer<estado, accion> 
let reducer: React.Reducer<estado, accion> =
  (state, action) => {
    switch (action.type) {
      case 'SET_NOTES':
        return { ...state, notes: action.notes, loading: false }
      case 'ADD_NOTE':
        return { ...state, notes: [action.note, ...state.notes] }
      case 'RESET_FORM':
        return { ...state, form: initialState.form }
      case 'SET_INPUT':
        return { ...state, form: { ...state.form, [action.name]: action.value } }
      case 'ERROR':
        return { ...state, loading: false, error: true }
      default:
        return state
    }
  }

type TParams = {};

const Monedas: FunctionComponent<RouteComponentProps<TParams>> = function (props: RouteComponentProps<TParams>) {
  //Usamos useReducer como hook
  const [state, dispatch] = useReducer(reducer, initialState)

  //Protege el acceso
  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .catch(() => {
        props.history.push('/profile')
      })
  }, [])

  //Una vez se ha creado el virtual DOM
  useEffect(() => {
    fetchNotes()
    const subscription = API.graphql(graphqlOperation(onCreateNote))
    // @ts-ignore:
      .subscribe({
        next: update_notes
      })
    return () => subscription.unsubscribe()
  }, [])

  //Que hacer cuando se haya creado una nota
  function update_notes(x:any){
    const note = x.value.data.onCreateNote
    if(note===null)return
    console.log(note)
    if (CLIENT_ID === note.clientId) return
    //Actualizar el estado cuando la nueva nota, no la hayamos creado nosotros
    dispatch({ type: 'ADD_NOTE', note })
  }

  async function fetchNotes() {
    try {
      //Recupera los datos
      //let notesData: { data: { listnotes: items[] } }
      const notesData = await API.graphql(graphqlOperation(listNotes))
      // @ts-ignore:
      dispatch({ type: 'SET_NOTES', notes: notesData.data.listNotes.items })

    } catch (err) {
      console.log('error: ', err)
      dispatch({ type: 'ERROR' })
    }
  }

  function onChange(e:React.ChangeEvent<HTMLInputElement>) {
    dispatch({ type: 'SET_INPUT', name: e.target.name, value: e.target.value })
  }

  async function createNote() {
    const { form } = state
    if (!form.name || !form.description) return alert('por favor, introduzca un nombre y descripción')
    const note = { ...form, clientId: CLIENT_ID, completed: false }
    dispatch({ type: 'ADD_NOTE', note })
    dispatch({ type: 'RESET_FORM' })
    try {
      //Invoca a una mutación
      await API.graphql(graphqlOperation(CreateNote, { input: note }))
      console.log('se ha creado la nota!')
    } catch (err) {
      console.log("error: ", err)
    }
  }

  async function updateNote(note:nota) {
    const index = state.notes.findIndex(n => n.id === note.id)
    const notes = [...state.notes]
    notes[index].completed = !note.completed
    dispatch({ type: 'SET_NOTES', notes })
    try {
      await API.graphql(graphqlOperation(UpdateNote, { input: notes[index] }))
      console.log('se ha actualizado la nota!')
    } catch (err) {
      console.log('error: ', err)
    }
  }

  async function deleteNote( id:string|undefined) {
    const index = state.notes.findIndex(n => n.id === id)
    const notes = [...state.notes.slice(0, index), ...state.notes.slice(index + 1)];
    dispatch({ type: 'SET_NOTES', notes })
    try {
      await API.graphql(graphqlOperation(DeleteNote, { input: { id } }))
      console.log('se borro la nota!')
    } catch (err) {
      console.log({ err })
    }
  }

  function renderItem(item:nota) {
    return (
      <List.Item
        style={styles.item}
        actions={[
          <p style={styles.p} onClick={() => deleteNote(item.id)}>Delete</p>,
          <p style={styles.p} onClick={() => updateNote(item)}>
            {item.completed ? 'completed' : 'mark completed'}
          </p>
        ]}
      >
        <List.Item.Meta
          title={item.name}
          description={item.description}
        />
      </List.Item>
    )
  }

  return (
    <div style={styles.container}>
      <Input
        onChange={onChange}
        value={state.form?.name}
        placeholder="Note Name"
        name='name'
        style={styles.input}
      />
      <Input
        onChange={onChange}
        value={state.form?.description}
        placeholder="Note description"
        name='description'
        style={styles.input}
      />
      <Button
        onClick={createNote}
        type="primary"
      >Create Note</Button>
      <List
        loading={state.loading}
        dataSource={state.notes}
        renderItem={renderItem}
      />
    </div>
  );
}

export default Monedas;
