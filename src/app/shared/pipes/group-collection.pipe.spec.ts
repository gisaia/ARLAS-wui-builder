import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader, TranslateService } from '@ngx-translate/core';
import { GroupCollectionPipe } from './group-collection.pipe';

describe('GroupCollectionPipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateNoOpLoader
          }
        })
      ]
    });
  });

  it('create an instance', () => {
    const pipe = new GroupCollectionPipe(TestBed.inject(TranslateService));
    expect(pipe).toBeTruthy();
  });
});
