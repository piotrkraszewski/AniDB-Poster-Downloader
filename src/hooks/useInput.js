import {useState} from 'react'

export default initialVal => {
  const [value, setValue] = useState(initialVal)
  const changeForm = (e) => {
    setValue(e.target.value)
  }
  const resetForm = () =>{
    setValue('')
  }
  return [value, setValue, changeForm, resetForm]
}