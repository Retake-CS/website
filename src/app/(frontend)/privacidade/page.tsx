export default function Privacidade() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-rcs-sec mb-6">Política de Privacidade</h1>
      <div className="prose max-w-4xl">
        <p className="mb-4">
          Esta Política de Privacidade descreve como o RCS coleta, usa e protege suas informações pessoais.
        </p>

        <h2 className="text-2xl font-bold text-rcs-sec mt-8 mb-4">Informações que coletamos</h2>
        <p className="mb-4">
          Podemos coletar informações pessoais como nome, email e preferências quando você:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>Se registra em nossa newsletter</li>
          <li>Entra em contato conosco</li>
          <li>Participa de enquetes ou comentários</li>
        </ul>

        <h2 className="text-2xl font-bold text-rcs-sec mt-8 mb-4">Como usamos suas informações</h2>
        <p className="mb-4">
          Utilizamos suas informações para:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>Fornecer conteúdo personalizado</li>
          <li>Enviar newsletters e atualizações</li>
          <li>Melhorar nossos serviços</li>
          <li>Responder às suas perguntas</li>
        </ul>

        <h2 className="text-2xl font-bold text-rcs-sec mt-8 mb-4">Proteção de dados</h2>
        <p className="mb-4">
          Implementamos medidas de segurança para proteger suas informações pessoais contra acesso não autorizado,
          alteração, divulgação ou destruição.
        </p>

        <h2 className="text-2xl font-bold text-rcs-sec mt-8 mb-4">Contato</h2>
        <p>
          Se você tiver dúvidas sobre esta política, entre em contato conosco através do email: contato@rcs.com.br
        </p>
      </div>
    </div>
  );
}
