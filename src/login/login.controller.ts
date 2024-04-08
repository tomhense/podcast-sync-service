import { Body, Controller, Param, Post, Render, Get } from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('index.php/login/v2')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('/')
  async generateFlow(): Promise<any> {
    return this.loginService.generateFlow();
  }

  // The target for the login form
  @Post('/grant')
  @Render('login')
  async grant(
    @Body() formData: { username: string; password: string; flow_id: string },
  ): Promise<any> {
    if (
      this.loginService.grantFlow(
        formData.username,
        formData.password,
        formData.flow_id,
      )
    ) {
      // Successful authentication
      return {
        flow_id: formData.flow_id,
        message: 'Successfully authenticated device',
      };
    } else {
      // Wrong credentials
      return {
        flow_id: formData.flow_id,
        message: 'Wrong credentials',
        status: 401,
      };
    }
  }

  @Get('/flow/:flowId')
  @Render('login')
  async loginPage(@Param() params: any): Promise<any> {
    // Return html login page, this needs to be templated so that the flowId is included in the form as a hidden field
    return { flow_id: params.flowId, message: '' };
  }

  @Post('/poll')
  async poll(@Body() body: { token: string }): Promise<any> {
    return this.loginService.pollFlow(body.token);
  }
}
