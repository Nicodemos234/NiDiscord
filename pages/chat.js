import NextImage from 'next/image'
import { useRouter } from 'next/router'
import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import { createClient } from '@supabase/supabase-js';
import React from 'react';
import appConfig from '../config.json';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker'

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzMyMzI5MCwiZXhwIjoxOTU4ODk5MjkwfQ.mD0Y8H2Ery-eMlsYKvbyBa7V7DEPLwF7QafBzPnOrks'
const SUPABASE_URL = 'https://lvnswpqoxbkirqipktdw.supabase.co'
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)


export default function ChatPage() {
  const roteamento = useRouter()
  const usuarioLogado = roteamento.query.username
  const [mensagem, setMensagem] = React.useState('')
  const [listaMensagem, setListaMensagem] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const listenNewMessages = (addMessage) => {
    return supabaseClient
      .from('mensagens')
      .on('INSERT', (response) => {
        addMessage(response.new)
      })
      .subscribe()
  }

  React.useEffect(() => {
    supabaseClient
      .from('mensagens')
      .select('*')
      .order('id', { ascending: false })
      .then(({ data }) => {
        setListaMensagem(data)
        setLoading(false)
      })
    listenNewMessages((mensagem) => { setListaMensagem(listaMensagens => [mensagem, ...listaMensagens]) })
  }, [])

  const handleNovaMensagem = (novaMensagem) => {
    const mensagem = {
      de: usuarioLogado,
      texto: novaMensagem
    }

    supabaseClient.from('mensagens').insert([mensagem]).then((data) => console.log(data))

    setMensagem('')
  }
  return (
    <Box
      styleSheet={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://i.imgur.com/pzd56iI.jpg)`,
        backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
        color: appConfig.theme.colors.neutrals['000']
      }}
    >

      <Box
        styleSheet={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
          borderRadius: '5px',
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: '100%',
          maxWidth: '95%',
          maxHeight: '95vh',
          padding: '32px',
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            height: '80%',
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: 'column',
            borderRadius: '5px',
            padding: '16px',
          }}
        >
          {loading && <Loading />}
          <MessageList mensagens={listaMensagem} setMensagens={setListaMensagem} />
          <Box
            as="form"
            styleSheet={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TextField
              value={mensagem}
              onChange={(event) => setMensagem(event.target.value)}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  handleNovaMensagem(mensagem)
                  event.preventDefault()
                }
              }}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: '100%',
                border: '0',
                resize: 'none',
                borderRadius: '5px',
                padding: '6px 8px',
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: '12px',
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <ButtonSendSticker onStickerClick={(sticker) => handleNovaMensagem(`:sticker:${sticker}`)} />
            <Button
              buttonColors={{
                contrastColor: appConfig.theme.colors.neutrals["000"],
                mainColor: appConfig.theme.colors.primary[500],
                mainColorLight: appConfig.theme.colors.primary[400],
                mainColorStrong: appConfig.theme.colors.primary[600],
              }}
              label='Enviar'
              onClick={() => handleNovaMensagem(mensagem)}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function Header() {
  return (
    <>
      <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
        <Text variant='heading5'>
          Chat
        </Text>
        <Button
          variant='tertiary'
          colorVariant='neutral'
          label='Logout'
          href="/"
        />
      </Box>
    </>
  )
}

function Loading() {
  return (<div className='pauloLoading'>
    <NextImage src='/assets/paulo.png' width='366' height='395' alt='Paulo' />
    <style jsx>{`
    .pauloLoading {
      position: absolute;
      top: calc(50% - 197px);
      left: calc(50% - 183px);
      z-index: 10;
      -webkit-animation:spin 4s linear infinite;
      -moz-animation:spin 4s linear infinite;
      animation:spin 1s linear infinite;
    }
    @-moz-keyframes spin { 
      100% { -moz-transform: rotate(360deg); } 
    }
    @-webkit-keyframes spin { 
        100% { -webkit-transform: rotate(360deg); } 
    }
    @keyframes spin { 
        100% { 
            -webkit-transform: rotate(360deg); 
            transform:rotate(360deg); 
        } 
    }
  `}</style>
  </div>)
}

function MessageList({ mensagens, setMensagens }) {
  const [tooltipContent, setTooltipContent] = React.useState({})
  const handleShowDetailedUserInfo = async (mensagem) => {
    const url = `https://api.github.com/users/${mensagem.de}`
    const response = await fetch(url)
    const data = await response.json()
    setTooltipContent({ ...data, id: mensagem.id })
  }
  const handleHideDetaileduserInfo = () => {
    setTooltipContent({})
  }
  return (
    <Box
      tag="ul"
      styleSheet={{
        overflow: 'scroll',
        display: 'flex',
        flexDirection: 'column-reverse',
        flex: 1,
        color: appConfig.theme.colors.neutrals["000"],
        marginBottom: '16px',
        overflow: 'auto'
      }}
    >
      {mensagens?.map(mensagem => (
        <Text
          key={mensagem.id}
          tag="li"
          styleSheet={{
            borderRadius: '5px',
            padding: '6px',
            marginBottom: '12px',
            hover: {
              backgroundColor: appConfig.theme.colors.neutrals[700],
            },
            position: 'relative'
          }}
        >
          <Button
            onClick={() => setMensagens(mensagens => mensagens
              .filter(mensagemDaLista => mensagemDaLista.id !== mensagem.id))}
            label='X'
            styleSheet={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'transparent' }}
          />
          <Box
            styleSheet={{
              marginBottom: '8px',
            }}
          >
            <div className='tooltipWrapper'>
              {tooltipContent.id === mensagem.id && <div className='tooltip' id={`tooltip-${mensagem.id}`}>
                <Image
                  styleSheet={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'inline-block',
                    marginRight: '8px',
                  }}
                  src={tooltipContent.avatar_url}
                /><br></br>
                followers: {tooltipContent.followers}<br></br>
                following: {tooltipContent.following}
              </div>}
              <div className='imageWrapper' onMouseEnter={() => handleShowDetailedUserInfo(mensagem)} onMouseLeave={handleHideDetaileduserInfo}>
                <Image
                  styleSheet={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'inline-block',
                    marginRight: '8px',
                  }}
                  src={`https://github.com/${mensagem.de}.png`}
                />
              </div>
            </div>
            <Text tag="strong">
              {mensagem.de}
            </Text>
            <Text
              styleSheet={{
                fontSize: '10px',
                marginLeft: '8px',
                color: appConfig.theme.colors.neutrals[300],
              }}
              tag="span"
            >
              {(new Date().toLocaleDateString())}
            </Text>
          </Box>
          {mensagem.texto.startsWith(':sticker:')
            ? <Image src={mensagem.texto.replace(':sticker:', ' ')} />
            : mensagem.texto}
        </Text>
      ))}
      <style jsx>{`
         .tooltipWrapper {
           position: relative;
         }
         .tooltip {
           position: absolute;
           top: -120px;
           z-index: 10;
           background-color: ${appConfig.theme.colors.neutrals[900]};
           color: white;
           border-radius: 10px;
           padding: 10px;
         }
  `}</style>
    </Box>
  )
}