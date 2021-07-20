# Instalar el CLI de Amplify

```ps
npm install -g @aws-amplify/cli
```

# Crear la App React

Crear el template de la aplicación _react_, usando typescript:

```ps
npx create-react-app mi-app --template typescript
```

# Configurar Amplify para nuestra App

Configuramos amplify:

```ps
cd mi-app

amplify configure
```

Especificamos los siguientes valores:

|Cuenta|Valor|
|-----|-----|
|euge|egsmartin@hotmail.com|
|Client ID|AKIAXBEVMWBDJKJG6AM4|
|Client Secret|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|

Instalamos las dependencias de Amplifly:

```ps
npm install aws-amplify @aws-amplify/ui-react
```

Lo inicializamos:

```ps
amplify init
```

# Crear Backend GraphQL 

Instalamos el modulo uuid para crear uuid:

```ps
npm install antd uuid
```

Para crear una api GraphQL usamos:

```ps
amplify add api


C:\Users\Eugenio\Downloads\app-gql>amplify add api
? Please select from one of the below mentioned services: GraphQL
? Provide API name: notesapi
? Choose the default authorization type for the API API key
? Enter a description for the API key: Mi clave de acceso
? After how many days from now the API key should expire (1-365): 365
? Do you want to configure advanced settings for the GraphQL API No, I am done.
? Do you have an annotated GraphQL schema? No
? Choose a schema template: One-to-many relationship (e.g., “Blogs” with “Posts” and “Comments”)
```

Elegimos GraphQL como tipo de API. En _amplify\backend\api\notesapi_ se genera el código. En _schema.graphql_ tenemos la definición del esquema:

```js
type Note @model {
  id: ID!
  clientId: ID
  name: String!
  description: String
  completed: Boolean
}
```
The GraphQL Transform library allows you to annotate a GraphQL schema with different directives like @model, @connection, @auth, and others. The @model directive we used in this schema will transform the base Note type into an expanded AWS AppSync GraphQL API complete with:

- Additional schema definitions for queries and mutations (Create, Read, Update, Delete, and List operations)
- Additional schema definitions for GraphQL subscriptions
- DynamoDB database
- Resolver code for all GraphQL operations mapped to DynamoDB database

Desplegamos la api:

```ps
amplify push

√ Generated GraphQL operations successfully and saved at src\graphql
√ Code generated successfully and saved in file src\API.ts
√ All resources are updated in the cloud

GraphQL endpoint: https://tl2do3hdpjgpjb4u2aakug5zse.appsync-api.eu-west-1.amazonaws.com/graphql
GraphQL API KEY: da2-btotoud4ufbl5japgddkfm5udm
```

Podemos probar la api - REST o GraphQL - usando la consola de amplify:

```ps
amplify console api
```

# Codigo

Estamos usando typscript, así que además de una prueba de concepto de _Amplify_ estamos analizando la versatilidad de _typescript_.

## Usar Amplify

Añadimos en index.ts que vamos a utilizar _Amplify_:

```js
import Amplify from 'aws-amplify'
import config from './aws-exports'
Amplify.configure(config)
```

## Estilos

Para definir los estilos, el tipo que usaremos es _CSS.Properties_:

```js
import CSS from 'csstype';

//En styles definimos varios elementos, todos ellos contendran uno o varios estilos, por eso los definimos como CSS.Properties
const styles = {
  container: { padding: '20', margin: '0' } as CSS.Properties,
  input: { marginBottom: '10' } as CSS.Properties,
  item: { textAlign: 'left' } as CSS.Properties,
  p: { color: '#1890ff' } as CSS.Properties
}
```

Ahora podremos usarla en el _jsx_ de forma habitual:

```js
  return (
    <div style={styles.container}>
```

## Tipos

Vamos a definir los tipos que usaremos para las notas, las acciones y el estado. Destacar por ejemplo como estamos definiendo algunas propiedades opcionales en estos tipos. Lo hacemos con _?_:

```js
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
```

Para las acciones nos conviene utilizar un tipo compuesto. Observar también como en el tipo de la accion estamos indicando, como parte del tipo, el dominio de valores posible:

```js
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
```

Con esto ya podemos definir el estado inicial:

```js
  
const initialState: estado = {
  notes: [],
  loading: true,
  error: false,
  form: { name: '', description: '' }
}
```

Vamos a utilizar __generics__, en este caso para definir una función, el reductor del estado _de tipo React.Reducer<estado, accion>_:

```js

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
```

## Hooks

### Estado

En este caso como el estado tiene una estructura más compleja, y que remos definir distintas acciones, atacando cada una de ellas a una parte específica del estado, nos conviene usar _useReducer_:

```js
//Usamos useReducer como hook
const [state, dispatch] = useReducer(reducer, initialState)
```

### useEffect

Para actualizar el _DOM_ con los datos del backend, usaremos useEffect:

```js
  useEffect(() => {
    fetchNotes()
    const subscription = API.graphql(graphqlOperation(onCreateNote))
    // @ts-ignore:
      .subscribe({
        next: update_notes
      })
    return () => subscription.unsubscribe()
  }, [])
```

En este caso estamos recuperando las Notas con _fetchNotes()_ - la función actualiza el estado, como veremos a continuación, y esto redunda en que se repinte la aplicación -, y por otro lado nos subscribimos con GraphQL para que se nos avise de la creación de notas:

```js
const subscription = API.graphql(graphqlOperation(onCreateNote))
```

__NOTA:__ Observese como usamos _// @ts-ignore:_ para indicarle a _tsc_ que se ignore el error en la linea más abajo. Con la subscripción indicamos que método debe ejecutarse cuando una nota sea creada:

```js
{
  next: update_notes
}
```

Lo que haremos es actualizar el estado siempre y cuando la nota no la hayamos creado nosotros:

```js
  //Que hacer cuando se haya creado una nota
  function update_notes(x:any){
    const note = x.value.data.onCreateNote
    if (CLIENT_ID === note.clientId) return
    //Actualizar el estado cuando la nueva nota, no la hayamos creado nosotros
    dispatch({ type: 'ADD_NOTE', note })
  }
```

Antes de pasar a comentar el método que usar una query de GraphQL, comentar que en el useEffect nos estamos asegurando de que cuando la App se "muera", se elimine la subscripción a GraphQL:

```js
 //Una vez se ha creado el virtual DOM
  useEffect(() => {
    fetchNotes()
 
 ...
 
    return () => subscription.unsubscribe()
  }, [])
```

El método que recupera las notas, actualiza el estado:

```js
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
```

## Handlers

Definimos a continuación los handlers que van a procesar los eventos de nuestra App:

```js
  function onChange(e:React.ChangeEvent<HTMLInputElement>) {

  async function createNote() {

  async function updateNote(note:nota) {

  async function deleteNote( id:string|undefined) {
```

Todos ellos se caracterizan por:

- Actualizar el estado

```js
  async function deleteNote( id:string|undefined) {
    const index = state.notes.findIndex(n => n.id === id)
    const notes = [...state.notes.slice(0, index), ...state.notes.slice(index + 1)];
    dispatch({ type: 'SET_NOTES', notes })
```

- Llamar a una mutación de GraphQL:

```js
    try {
      await API.graphql(graphqlOperation(DeleteNote, { input: { id } }))
      console.log('se borro la nota!')
    } catch (err) {
      console.log({ err })
    }
```

## Autenticación

Vamos a utilizar rutas:

```ps
npm install react-router-dom @types/react-router-dom
```

Añadimos el backend de autenticación

```ps
amplify add auth
```

```ps
amplify push
```

