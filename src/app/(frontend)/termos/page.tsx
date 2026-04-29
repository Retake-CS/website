export default function Termos() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-rcs-sec mb-6">Termos de Uso</h1>
      <div className="prose max-w-4xl">
        <p className="mb-4">
          Bem-vindo ao RCS! Estes termos de uso regem o uso do nosso site e serviços.
          Ao acessar ou usar nosso site, você concorda com estes termos.
        </p>

        <h2 className="text-2xl font-bold text-rcs-sec mt-8 mb-4">Uso do Site</h2>
        <p className="mb-4">
          Você pode usar nosso site para fins pessoais e não comerciais, desde que:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>Não viole leis ou regulamentos aplicáveis</li>
          <li>Não infrinja direitos de terceiros</li>
          <li>Não prejudique a funcionalidade do site</li>
          <li>Use o conteúdo apenas para fins informativos</li>
        </ul>

        <h2 className="text-2xl font-bold text-rcs-sec mt-8 mb-4">Conteúdo do Usuário</h2>
        <p className="mb-4">
          Ao enviar conteúdo para nosso site (como comentários), você garante que:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>É o proprietário do conteúdo ou tem permissão para usá-lo</li>
          <li>O conteúdo não viola direitos de terceiros</li>
          <li>O conteúdo não é ilegal, prejudicial ou ofensivo</li>
        </ul>

        <h2 className="text-2xl font-bold text-rcs-sec mt-8 mb-4">Propriedade Intelectual</h2>
        <p className="mb-4">
          Todo o conteúdo do site, incluindo textos, imagens, logos e design,
          é propriedade do RCS ou de seus licenciadores e está protegido por leis de direitos autorais.
        </p>

        <h2 className="text-2xl font-bold text-rcs-sec mt-8 mb-4">Limitação de Responsabilidade</h2>
        <p className="mb-4">
          O RCS não se responsabiliza por danos diretos, indiretos ou consequenciais
          decorrentes do uso do site ou da impossibilidade de usá-lo.
        </p>

        <h2 className="text-2xl font-bold text-rcs-sec mt-8 mb-4">Modificações</h2>
        <p>
          Reservamo-nos o direito de modificar estes termos a qualquer momento.
          As alterações entrarão em vigor imediatamente após a publicação no site.
        </p>
      </div>
    </div>
  );
}
