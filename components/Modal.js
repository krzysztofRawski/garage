import { Close } from '@material-ui/icons'

const Modal = ({ children, error, closeModal }) => {
  return (
    <div className='modal'>
      <div className='content'>
        <Close onClick={() => closeModal()} />
        {children}
        {error && <p className='error'>{error}</p>}
      </div>
    </div>
  )
}

export default Modal
